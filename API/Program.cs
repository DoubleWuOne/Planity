using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddOpenApi();

//add later to extension
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IRoutineService, RoutineService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IAccountService, AccountService>();

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<UserEntity>()
    .AddEntityFrameworkStores<PlanityDbContext>();

builder.Services.AddDbContext<PlanityDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapGroup("api").MapIdentityApi<UserEntity>();
app.Run();
